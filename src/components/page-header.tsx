export default function PageHeader(
  {
    title
  }: {
    title: string;
  }
) {

  return (

    <div
      className="
        sticky
        top-0
        z-50
        bg-white
        border-b
        shadow-sm
        mb-6
        px-2
        py-3
        flex
        items-center
        justify-between
      "
    >

      <a
        href="/"
        className="
          text-blue-600
          hover:underline
          font-medium
        "
      >
        ← Inicio
      </a>

      <span
        className="
          font-bold
          text-lg
        "
      >
        {title}
      </span>

    </div>

  );

}