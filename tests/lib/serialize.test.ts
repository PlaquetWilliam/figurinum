import { describe, it, expect } from "vitest";
import { Types } from "mongoose";
import { serialize } from "@/lib/serialize";

describe("serialize", () => {
  it("convertit un ObjectId en chaîne", () => {
    const id = new Types.ObjectId();
    expect(serialize(id)).toBe(id.toString());
  });

  it("renomme _id en id et supprime __v", () => {
    const id = new Types.ObjectId();
    const input = { _id: id, name: "Figurine", __v: 0 };
    const result = serialize<{ id: string; name: string; __v?: number }>(input);
    expect(result.id).toBe(id.toString());
    expect(result.name).toBe("Figurine");
    expect(result.__v).toBeUndefined();
  });

  it("traite récursivement les objets imbriqués (ex: product dans cartItem)", () => {
    const cartId = new Types.ObjectId();
    const productId = new Types.ObjectId();
    const input = {
      _id: cartId,
      quantity: 2,
      product: { _id: productId, name: "Figurine", stock: 5 },
    };
    const result = serialize<{
      id: string;
      quantity: number;
      product: { id: string; name: string; stock: number };
    }>(input);
    expect(result.id).toBe(cartId.toString());
    expect(result.product.id).toBe(productId.toString());
    expect(result.product.name).toBe("Figurine");
  });


  it("déroule un faux document Mongoose via toObject()", () => {
    const id = new Types.ObjectId();
    const fakeDoc = {
      $__: {}, // marqueur interne Mongoose utilisé par isMongooseDoc()
      toObject: ({ virtuals }: { virtuals?: boolean } = {}) => ({
        _id: id,
        name: "Figurine",
        virtualField: virtuals ? "présent" : undefined,
      }),
    };
    const result = serialize<{ id: string; name: string; virtualField?: string }>(
      fakeDoc
    );
    expect(result.id).toBe(id.toString());
    expect(result.virtualField).toBe("présent");
  });
});
