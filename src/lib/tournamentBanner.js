export const BANNER_MEDIA = {
  maxBytes: 5 * 1024 * 1024,
  recommendWidth: 1132,
  recommendHeight: 280,
  minWidth: 800,
  minHeight: 198,          
  targetAspect: 1132 / 280, 
  aspectTolerance: 0.50,
  accept: "image/jpeg,image/png,image/webp",
};

export const BANNER_SPEC_LABEL = `${BANNER_MEDIA.recommendWidth} × ${BANNER_MEDIA.recommendHeight} px (wide banner), max 5 MB, JPEG/PNG/WebP`;

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });
}

export async function validateBannerFile(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!BANNER_MEDIA.accept.split(",").includes(file.type)) {
    throw new Error("Banner must be JPEG, PNG, or WebP.");
  }

  if (file.size > BANNER_MEDIA.maxBytes) {
    throw new Error("Banner must be 5 MB or smaller.");
  }

  const { width, height } = await readImageDimensions(file);

  if (width < BANNER_MEDIA.minWidth || height < BANNER_MEDIA.minHeight) {
    throw new Error(
      `Banner must be at least ${BANNER_MEDIA.minWidth} × ${BANNER_MEDIA.minHeight} px.`
    );
  }

   const aspect = width / height;
  const delta = Math.abs(aspect - BANNER_MEDIA.targetAspect) / BANNER_MEDIA.targetAspect;
  if (delta > BANNER_MEDIA.aspectTolerance) {
    throw new Error(
      `Use a wide banner image (${BANNER_MEDIA.recommendWidth} × ${BANNER_MEDIA.recommendHeight} px recommended). Selected image is ${width} × ${height} px.`
    );
  }
  return { width, height };
}

export async function uploadPendingBanner(tournamentId, file) {
  const { uploadTournamentMedia } = await import("./tournamentMedia");
  const result = await uploadTournamentMedia(tournamentId, file, "banner");
  return result.url || result.key;
}
