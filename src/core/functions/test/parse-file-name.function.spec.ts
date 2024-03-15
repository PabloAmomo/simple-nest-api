import parseFileName from '../parse-file-name.function';

describe('parseFileName', () => {
  it('should replace whitespace with underscores', () => {
    const result = parseFileName('file name with spaces');
    expect(result).toEqual('file_name_with_spaces');
  });

  it('should remove unwanted characters', () => {
    const result = parseFileName('file!@#$%^&*()_name.png');
    expect(result).toEqual('file_name.png');
  });

  it('should truncate to maxLength characters', () => {
    const result = parseFileName(
      'a_very_long_file_name_that_exceeds_the_max_length_of_10_characters.png',
      10,
    );
    expect(result.length).toBe(10);
  });

  it('should handle maxLength being longer than input text', () => {
    const result = parseFileName('short', 10);
    expect(result).toEqual('short');
  });

  it('should handle empty input', () => {
    const result = parseFileName('');
    expect(result).toEqual('');
  });

  it('should handle null input', () => {
    const result = parseFileName(null);
    expect(result).toEqual('');
  });

  it('should handle undefined input', () => {
    const result = parseFileName(undefined);
    expect(result).toEqual('');
  });
});
