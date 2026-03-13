import { DaysOpenPipe } from './days-open.pipe';

describe('DaysOpenPipe', () => {
  let pipe: DaysOpenPipe;

  beforeEach(() => {
    pipe = new DaysOpenPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "Today" for 0', () => {
    expect(pipe.transform(0)).toBe('Today');
  });

  it('should return "1 day" for 1', () => {
    expect(pipe.transform(1)).toBe('1 day');
  });

  it('should return "5 days" for 5', () => {
    expect(pipe.transform(5)).toBe('5 days');
  });

  it('should return "30 days" for 30', () => {
    expect(pipe.transform(30)).toBe('30 days');
  });

  it('should handle null by returning "null days"', () => {
    expect(pipe.transform(null as any)).toBe('null days');
  });

  it('should handle undefined by returning "undefined days"', () => {
    expect(pipe.transform(undefined as any)).toBe('undefined days');
  });
});
