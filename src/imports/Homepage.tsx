import imgImage from "figma:asset/13b37424ddd94821de36d9bc7b5c484ae9390436.png";
import imgImage1 from "figma:asset/7e8ccc97e1845261786ea69a2cff8516cf16d38b.png";
import imgImage2 from "figma:asset/8dfab5c979a9995f4d8533588e55b8c3c5e3b01a.png";
import imgImage3 from "figma:asset/81133a8c02523562d2b4ed99b50940f06ceb90e8.png";
import imgImage4 from "figma:asset/ac08fe21b110476c2228f98f687a9e720f66d8c0.png";
import imgImage5 from "figma:asset/35c96563a893b767aa41d721377799f5c81f8785.png";

export default function Homepage() {
  return (
    <div className="relative size-full" data-name="Homepage">
      <div className="absolute h-[3477px] left-0 top-[17380px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3476px] left-0 top-[13904px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3476px] left-0 top-[10428px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[3476px] left-0 top-[6952px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute h-[3476px] left-0 top-[3476px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
      <div className="absolute h-[3476px] left-0 top-0 w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage5} />
      </div>
    </div>
  );
}