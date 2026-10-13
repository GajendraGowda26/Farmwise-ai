import FarmwiseApp from "@/components/FarmwiseApp";

// Side-by-side view of both screens, like the design reference.
export default function Preview() {
  return (
    <main className="stage stage--preview">
      <FarmwiseApp />
      <FarmwiseApp forceListening />
    </main>
  );
}
