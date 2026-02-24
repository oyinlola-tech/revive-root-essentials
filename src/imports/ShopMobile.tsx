import imgImage from "figma:asset/85c02bc0f67ea4dfa8a341cae2f7600515ad6790.png";
import imgImage1 from "figma:asset/07b49e96595d2b4539e76ac80ca9c64699851915.png";
import imgImage2 from "figma:asset/91582aea8ad519666113fa3bb5998cdafcd2a2d5.png";
import imgImage3 from "figma:asset/2fcb45b3cb3a472a7e8fb5f3fa7df25ee1ba3112.png";
import imgImage4 from "figma:asset/cbd5e9f15477cb205f45a0ec4f199f8177e6d039.png";

export default function ShopMobile() {
  return (
    <div className="relative size-full" data-name="Shop - Mobile">
      <div className="absolute h-[3759px] left-0 top-[15036px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3759px] left-0 top-[11277px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3759px] left-0 top-[7518px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[3759px] left-0 top-[3759px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
      <div className="absolute h-[3759px] left-0 top-0 w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage4} />
      </div>
    </div>
  );
}