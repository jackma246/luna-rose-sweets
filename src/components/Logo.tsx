import Image from "next/image";

export default function Logo({
  className = "",
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      {/* Pink circle frame image as background */}
      <Image
        src="/images/pink-circle-frame.jpg"
        alt=""
        fill
        style={{ objectFit: "cover" }}
        priority
      />
      {/* Logo on top, centered within the circle */}
      <div
        style={{
          position: "absolute",
          inset: "15%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/ds-logo.png"
          alt="Dip & Sprinkle"
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          style={{
            objectFit: "contain",
            width: "100%",
            height: "100%",
          }}
          priority
        />
      </div>
    </div>
  );
}
