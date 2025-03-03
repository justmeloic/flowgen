export const SUPPORTED_FILE_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.docx',
  '.md',
  '.json',
  '.yaml',
  '.yml',
]

export const getSupportedFileTypesText = (): string => {
  return SUPPORTED_FILE_EXTENSIONS.map((ext) =>
    ext.toUpperCase().replace('.', '')
  ).join(', ')
}

export const isFileTypeSupported = (filename: string): boolean => {
  const extension = filename.toLowerCase().split('.').pop()
  return extension ? SUPPORTED_FILE_EXTENSIONS.includes(`.${extension}`) : false
}
