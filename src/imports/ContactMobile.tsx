import imgImage from "figma:asset/fcead68bd0e6ae9682ebaaa437a023780489fd86.png";
import imgImage1 from "figma:asset/08dcb359f4ee6fb5c5b66bf88b65877cb05ce86c.png";
import imgImage2 from "figma:asset/a1d8c36d9f5bf3f9d3ca72d89301cf12d847c452.png";

export default function ContactMobile() {
  return (
    <div className="relative size-full" data-name="Contact - Mobile">
      <div className="absolute h-[3465px] left-0 top-[6926px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3463px] left-0 top-[3463px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3463px] left-0 top-0 w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}