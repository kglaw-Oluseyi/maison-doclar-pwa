import sharp from 'sharp'

export async function generateEventIcons(
  masterImageBuffer: Buffer,
  slug: string,
): Promise<{
  icon192: Buffer
  icon512: Buffer
  icon512Maskable: Buffer
  appleTouchIcon: Buffer
}> {
  void slug

  const [icon192, icon512, icon512Maskable, appleTouchIcon] = await Promise.all([
    sharp(masterImageBuffer).resize(192, 192).png().toBuffer(),
    sharp(masterImageBuffer).resize(512, 512).png().toBuffer(),
    sharp(masterImageBuffer)
      .resize(512, 512)
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      })
      .resize(512, 512)
      .png()
      .toBuffer(),
    sharp(masterImageBuffer).resize(180, 180).png().toBuffer(),
  ])

  return { icon192, icon512, icon512Maskable, appleTouchIcon }
}

