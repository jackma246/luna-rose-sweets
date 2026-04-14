"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

const images = [
  "/images/cakesicles/5.png",
  "/images/cupcakes/1.jpg",
  "/images/strawberries/basket-1.jpg",
  "/images/cake-pops/basic.jpg",
  "/images/treat-boxes/mixed-treats.jpg",
];

export default function InstaGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const items = grid.querySelectorAll<HTMLElement>(".insta-item");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add("revealed"), i * 100);
          });
          observer.unobserve(grid);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-5 gap-2">
      {images.map((src, i) => (
        <div
          key={i}
          className="insta-item aspect-square overflow-hidden relative group rounded-sm"
        >
          <Image
            src={src}
            alt="Instagram post"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-heading/0 group-hover:bg-heading/10 transition-colors duration-300" />
        </div>
      ))}
    </div>
  );
}
