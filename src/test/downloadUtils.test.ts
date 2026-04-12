import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadJson, downloadBlob } from '../utils/export/downloadUtils';

// Minimal DOM stubs for jsdom environment
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockClick = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('downloadBlob', () => {
  it('creates a temporary <a> element and triggers a click', () => {
    vi.useFakeTimers();
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const blob = new Blob(['test'], { type: 'text/plain' });

    // Intercept createElement to inject our mock click
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick });
      }
      return el;
    });

    downloadBlob(blob, 'test.txt');

    expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    expect(mockClick).toHaveBeenCalled();
    expect(appendSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();

    // revokeObjectURL is deferred via setTimeout — advance timers to trigger it
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});

describe('downloadJson', () => {
  it('serializes data to JSON and triggers download', () => {
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        Object.defineProperty(el, 'click', { value: mockClick });
      }
      return el;
    });

    const data = { hello: 'world', value: 42 };
    downloadJson(data, 'data.json');

    expect(appendSpy).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // The blob passed to createObjectURL should contain JSON
    const blobArg = mockCreateObjectURL.mock.calls.at(-1)?.[0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe('application/json');
  });
});
