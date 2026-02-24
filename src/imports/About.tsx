import imgImage from "figma:asset/fe62c943beda3a1ea0f00376c8a30d6ac6e0efbe.png";
import imgImage1 from "figma:asset/8b9cfe1cc77582e0e96cd9babf6d554812027269.png";
import imgImage2 from "figma:asset/a55fdbc7a58e73901eac3b672bc4aa8829aa0383.png";

export default function About() {
  return (
    <div className="relative size-full" data-name="About">
      <div className="absolute h-[3753px] left-0 top-[7502px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      </div>
      <div className="absolute h-[3751px] left-0 top-[3751px] w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute h-[3751px] left-0 top-0 w-[2880px]" data-name="Image">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}