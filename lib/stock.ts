import { Product } from "@/lib/models";

export type StockLine = {
  productId: string;
  quantity: number;
};

export type StockReservation =
  | { ok: true }
  | { ok: false; failedProductId: string };

/**
 * Décrément conditionnel et atomique du stock.
 *
 * La condition `stock: { $gte: quantity }` fait partie du filtre de la mise à
 * jour : MongoDB évalue le stock et le décrémente dans la même opération, sur
 * le même document. Deux commandes concurrentes sur le dernier article ne
 * peuvent donc pas réussir toutes les deux — la seconde ne trouve plus de
 * document correspondant au filtre. Un `find()` suivi d'un `$inc` séparé
 * laisserait au contraire une fenêtre où les deux lectures voient le même stock.
 *
 * @returns `true` si la quantité a bien été réservée, `false` si le stock est insuffisant.
 */
export async function reserveStock(
  productId: string,
  quantity: number
): Promise<boolean> {
  // Une quantité nulle ou négative transformerait le décrément en crédit.
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return false;
  }

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  return updatedProduct !== null;
}

/** Recrédite le stock d'un produit (annulation de commande, compensation). */
export async function restoreStock(
  productId: string,
  quantity: number
): Promise<void> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return;
  }

  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: quantity },
  });
}

/** Restitue une liste de réservations déjà effectuées. */
export async function releaseReservedStock(lines: StockLine[]): Promise<void> {
  for (const line of lines) {
    await restoreStock(line.productId, line.quantity);
  }
}

/**
 * Réserve le stock de toutes les lignes, ou d'aucune.
 *
 * MongoDB ne garantit l'atomicité que sur un seul document : réserver
 * plusieurs produits demande donc plusieurs opérations. Plutôt qu'une
 * transaction multi-documents (qui imposerait un replica set à toute
 * l'infrastructure), on applique une compensation : dès qu'une ligne échoue,
 * les lignes déjà réservées sont recréditées avant de retourner l'échec.
 */
export async function reserveStockForItems(
  lines: StockLine[]
): Promise<StockReservation> {
  const reserved: StockLine[] = [];

  for (const line of lines) {
    let succeeded = false;

    try {
      succeeded = await reserveStock(line.productId, line.quantity);
    } catch (error) {
      await releaseReservedStock(reserved);
      throw error;
    }

    if (!succeeded) {
      await releaseReservedStock(reserved);
      return { ok: false, failedProductId: line.productId };
    }

    reserved.push(line);
  }

  return { ok: true };
}
