import imgImage from "figma:asset/708493b4a37502d9a7ac11244d06beaf7c216461.png";
import imgImage1 from "figma:asset/67ec4add013a276a201de1e1ef9e92498bbab65a.png";
import imgImage2 from "figma:asset/6dcb7d6fe81c839659be0cfd4f10a335f1bf64b5.png";
import imgImage3 from "figma:asset/4800e0bf37c309246f03ae8c3b365b1893d37ff4.png";

export default function ShopDetailsMobile() {
  return (
    <div className="relative size-full" data-name="Shop Details - Mobile">
      <div className="absolute h-[3135px] left-0 top-[9402px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3134px] left-0 top-[6268px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3134px] left-0 top-[3134px] w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
      <div className="absolute h-[3134px] left-0 top-0 w-[780px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage3} />
      </div>
    </div>
  );
}