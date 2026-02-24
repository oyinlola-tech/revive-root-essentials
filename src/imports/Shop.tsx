import imgImage from "figma:asset/1d4ac15c55a551e9d03ca2682900462f26e361b2.png";
import imgImage1 from "figma:asset/845a7301dcb644f8d5404c0683d226487f9ee95d.png";
import imgImage2 from "figma:asset/9737d913344278f605f544fd73839bbf342d042c.png";

export default function Shop() {
  return (
    <div className="relative size-full" data-name="Shop">
      <div className="absolute h-[3225px] left-0 top-[6446px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3223px] left-0 top-[3223px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3223px] left-0 top-0 w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}