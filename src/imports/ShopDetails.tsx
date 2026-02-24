import imgImage from "figma:asset/20efd16ccb58d98a3e8dab803b9e2476919880cb.png";
import imgImage1 from "figma:asset/c72f7ce5cc13dde699e34f32f6b183ef9d5d003e.png";
import imgImage2 from "figma:asset/d909d1df3376681c0d23fa7e0bbc07bccb23a131.png";

export default function ShopDetails() {
  return (
    <div className="relative size-full" data-name="Shop Details">
      <div className="absolute h-[3601px] left-0 top-[7202px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3601px] left-0 top-[3601px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3601px] left-0 top-0 w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}