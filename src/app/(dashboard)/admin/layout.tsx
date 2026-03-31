import { ReactHTMLElement } from "react";

export default function adminLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1>
        <a href="/admin/users">users</a>{" "}
        <a href="/admin/cars">cars</a>{" "}
        <a href="/admin/bookings">bookings</a>
      </h1>
      {children}
    </section>
  );
}
