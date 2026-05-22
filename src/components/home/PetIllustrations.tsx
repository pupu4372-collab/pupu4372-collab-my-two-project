import Image from "next/image";

export function PuppyOnMoon() {
  return (
    <div className="pointer-events-none absolute right-10 top-[22rem] hidden w-24 sm:block md:right-16 md:top-[24rem] md:w-32 lg:right-24 lg:top-[26rem] lg:w-40">
      <div className="relative">
        <div className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(255,217,102,0.34)_0%,rgba(255,214,224,0.2)_42%,rgba(248,244,255,0)_72%)] blur-xl" />
        <Image
          src="/images/home-dog-moon.png"
          alt=""
          width={721}
          height={627}
          priority
          className="relative h-auto w-full drop-shadow-[0_18px_30px_rgba(120,80,140,0.16)] [mask-image:radial-gradient(ellipse_at_center,black_48%,rgba(0,0,0,0.62)_64%,rgba(0,0,0,0.24)_74%,transparent_88%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function KittenCorner() {
  return (
    <div className="pointer-events-none absolute right-4 top-52 hidden w-32 sm:block md:right-12 md:top-56 md:w-40 lg:right-20 lg:top-60 lg:w-48">
      <div className="relative">
        <div className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(255,214,224,0.34)_0%,rgba(232,222,255,0.22)_44%,rgba(248,244,255,0)_74%)] blur-xl" />
        <Image
          src="/images/home-cat-zodiac.png"
          alt=""
          width={713}
          height={631}
          priority
          className="relative h-auto w-full drop-shadow-[0_18px_30px_rgba(120,80,140,0.14)] [mask-image:radial-gradient(ellipse_at_center,black_48%,rgba(0,0,0,0.62)_64%,rgba(0,0,0,0.24)_74%,transparent_88%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function PawCrystalOrb() {
  return (
    <div className="pointer-events-none absolute left-0 top-52 z-0 hidden w-56 sm:block md:left-4 md:top-56 md:w-72 lg:left-8 lg:top-60 lg:w-80">
      <div className="relative">
        <div className="absolute -inset-16 rounded-full bg-[radial-gradient(circle,rgba(255,199,226,0.6)_0%,rgba(232,212,248,0.47)_34%,rgba(168,230,207,0.24)_58%,rgba(248,244,255,0)_78%)] blur-3xl" />
        <div className="absolute -inset-10 rounded-full bg-[conic-gradient(from_120deg,rgba(255,217,102,0.38),rgba(248,200,232,0.5),rgba(232,212,248,0.45),rgba(168,230,207,0.31),rgba(255,217,102,0.38))] blur-2xl" />
        <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,246,252,0.43)_46%,rgba(255,255,255,0)_76%)] blur-lg" />
        <Image
          src="/images/home-paw-orb.png"
          alt=""
          width={718}
          height={628}
          priority
          className="relative h-auto w-full opacity-80 drop-shadow-[0_24px_42px_rgba(139,92,246,0.16)] [mask-image:radial-gradient(ellipse_at_center,black_42%,rgba(0,0,0,0.68)_58%,rgba(0,0,0,0.26)_70%,transparent_84%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}
