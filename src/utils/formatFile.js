export function formatFileName(fileName, maxLength = 24) {
  const dotIndex = fileName.lastIndexOf('.')

  if (dotIndex === -1 || fileName.length <= maxLength) {
    return fileName
  }

  const extension = fileName.slice(dotIndex)
  const name = fileName.slice(0, dotIndex)

  const available = maxLength - extension.length - 3 // ...

  if (available <= 0) {
    return fileName
  }

  return `${name.slice(0, available)}...${extension}`
}
