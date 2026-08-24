import { getUser } from "@/lib/dal";
import { getCartCount } from "@/app/actions/cart";
import { NavbarClient } from "@/components/NavbarClient";

export async function Navbar() {
  const user = await getUser();
  const cartCount = await getCartCount(user.id);

  return <NavbarClient role={user.role} cartCount={cartCount} />;
}
