function getFileUrl(
  file: string | null | undefined, 
  folder: string, 
  defaultFile = "default.png"
):string {
  return file
    ? `${process.env.APP_URL}/public/images/${folder}/${file}`
    : `${process.env.APP_URL}/public/images/${folder}/${defaultFile}`;
}

export default getFileUrl;