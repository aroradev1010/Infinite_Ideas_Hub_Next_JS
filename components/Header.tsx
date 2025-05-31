"use client";

import Image from "next/image";
import React, { useEffect } from "react";

interface StarfieldProps {
  speedFactor?: number;
  backgroundColor?: string;
  starColor?: [number, number, number];
  starCount?: number;
}

const Starfield: React.FC<StarfieldProps> = ({
  speedFactor = 0.05,
  backgroundColor = "black",
  starColor = [255, 255, 255],
  starCount = 2000,
}) => {
  useEffect(() => {
    const canvas = document.getElementById("starfield") as HTMLCanvasElement;

    if (canvas) {
      const c = canvas.getContext("2d");

      if (c) {
        let w = window.innerWidth;
        let h = canvas.parentElement?.clientHeight || 128;

        const setCanvasExtents = () => {
          canvas.width = w;
          canvas.height = h;
        };

        setCanvasExtents();

        window.addEventListener("resize", () => {
          w = window.innerWidth;
          h = canvas.parentElement?.clientHeight || 128;
          setCanvasExtents();
        });

        const makeStars = (count: number) => {
          const out = [];
          for (let i = 0; i < count; i++) {
            const s = {
              x: Math.random() * 1600 - 800,
              y: Math.random() * 900 - 450,
              z: Math.random() * 1000,
            };
            out.push(s);
          }
          return out;
        };

        let stars = makeStars(starCount);

        const clear = () => {
          c.fillStyle = backgroundColor;
          c.fillRect(0, 0, canvas.width, canvas.height);
        };

        const putPixel = (x: number, y: number, brightness: number) => {
          const rgb = `rgba(${starColor[0]},${starColor[1]},${starColor[2]},${brightness})`;
          c.fillStyle = rgb;
          c.fillRect(x, y, 1, 1);
        };

        const moveStars = (distance: number) => {
          const count = stars.length;
          for (let i = 0; i < count; i++) {
            const s = stars[i];
            s.z -= distance;
            while (s.z <= 1) {
              s.z += 1000;
            }
          }
        };

        let prevTime: number;
        const init = (time: number) => {
          prevTime = time;
          requestAnimationFrame(tick);
        };

        const tick = (time: number) => {
          let elapsed = time - prevTime;
          prevTime = time;

          moveStars(elapsed * speedFactor);

          clear();

          const cx = w / 2;
          const cy = h / 2;

          const count = stars.length;
          for (let i = 0; i < count; i++) {
            const star = stars[i];

            const x = cx + star.x / (star.z * 0.001);
            const y = cy + star.y / (star.z * 0.001);

            if (x < 0 || x >= w || y < 0 || y >= h) {
              continue;
            }

            const d = star.z / 1000.0;
            const b = 1 - d * d;

            putPixel(x, y, b);
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(init);

        return () => {
          window.removeEventListener("resize", () => {});
        };
      } else {
        console.error("Could not get 2d context from canvas element");
      }
    } else {
      console.error('Could not find canvas element with id "starfield"');
    }
  }, [starColor, backgroundColor, speedFactor, starCount]);

  return (
    <canvas
      id="starfield"
      style={{
        padding: 0,
        margin: 0,
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 0,
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  );
};

const Header: React.FC = () => {
  return (
    <header className="relative w-full h-full bg-background overflow-hidden">
      <Starfield
        starCount={2000}
        speedFactor={0.05}
        backgroundColor="black"
        starColor={[255, 255, 255]}
      />
      <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center z-10">
        <Image
          src="/headerImage.png"
          alt="Header Image"
          width={150}
          height={50}
        />
        <h1 className="text-3xl font-bold text-white dark:text-gray-100">
          Thoughts, stories and ideas.
        </h1>
      </div>
    </header>
  );
};

export default Header;
