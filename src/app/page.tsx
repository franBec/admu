import Image from "next/image";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center gap-6 max-w-2xl px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg h-auto aspect-video">
          <Image
            src="/undraw_quiet-street_v45k.svg"
            alt="Ilustración de una calle tranquila"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
          Administración Municipal
        </h1>

        <p className="text-lg text-muted-foreground sm:text-xl">
          Ciudad de San Luis
        </p>
      </div>
    </div>
  );
}
