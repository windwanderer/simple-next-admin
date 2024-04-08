import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";

export async function GET() {
  // false => no db call for logout
  const session = await getSession(false);
  session.destroy();
  redirect("/admin/login");
}
