import imgImage from "figma:asset/8f30509ef4eb5c143ffc1a68e5ac70e2a416041d.png";
import imgImage1 from "figma:asset/c8a7d31c0112f59a579e6dc032f4090e925223e1.png";
import imgImage2 from "figma:asset/a939ddced9327a2597b0a58d202ecab35888d95b.png";
import imgImage3 from "figma:asset/8561cea610c4950f5cfae939e7c7fa0ad2798ccb.png";
import imgImage4 from "figma:asset/8adb51850fed7b0024fce5f186635c9a0a2e6ebc.png";

export default function AboutMobile() {
  return (
    <div className="relative size-full" data-name="About - Mobile">
      <div className="absolute h-[3601px] left-0 top-[14392px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3598px] left-0 top-[10794px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3598px] left-0 top-[7196px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[3598px] left-0 top-[3598px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute h-[3598px] left-0 top-0 w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
    </div>
  );
}