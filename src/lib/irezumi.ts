import type { Artist, FlashDesign } from "@/types/domain";

const irezumiKeywords = ["irezumi", "japanese traditional", "horimono"];

function hasIrezumiKeyword(values: Array<string | null | undefined>) {
  return values.some((value) => {
    const normalized = value?.toLowerCase() ?? "";

    return irezumiKeywords.some((keyword) => normalized.includes(keyword));
  });
}

export function isIrezumiArtist(artist: Artist) {
  return hasIrezumiKeyword(artist.styles);
}

export function isIrezumiDesign(design: FlashDesign) {
  return hasIrezumiKeyword([design.style, design.title]);
}
