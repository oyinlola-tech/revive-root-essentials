import imgImage from "figma:asset/ddb886e1b8e7ac42adec936ec391e677d6f3941e.png";
import imgImage1 from "figma:asset/3812809e23d3441f8154381ccc0c84e897e5e265.png";

export default function Contact() {
  return (
    <div className="relative size-full" data-name="Contact">
      <div className="absolute h-[4016px] left-0 top-[4015px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[4015px] left-0 top-0 w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
    </div>
  );
}