import { youtubeEmbedUrl, youtubeVideoId } from "@/lib/youtube";

const ID = "yzmTNoiOtiY";

describe("youtubeVideoId", () => {
  it("reads the v query parameter", () => {
    expect(youtubeVideoId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(youtubeVideoId(`http://youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://m.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://music.youtube.com/watch?v=${ID}`)).toBe(ID);
  });

  it("ignores extra query parameters", () => {
    expect(
      youtubeVideoId(`https://www.youtube.com/watch?v=${ID}&t=42s&list=PL123`),
    ).toBe(ID);
  });

  it("reads the short youtu.be path", () => {
    expect(youtubeVideoId(`https://youtu.be/${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://youtu.be/${ID}?t=42`)).toBe(ID);
    expect(youtubeVideoId(`https://youtu.be/${ID}/`)).toBe(ID);
  });

  it("reads embed, shorts, v and live paths", () => {
    expect(youtubeVideoId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://www.youtube.com/v/${ID}`)).toBe(ID);
    expect(youtubeVideoId(`https://www.youtube.com/live/${ID}`)).toBe(ID);
  });

  it("returns null for non-YouTube hosts", () => {
    expect(youtubeVideoId(`https://vimeo.com/watch?v=${ID}`)).toBeNull();
    expect(youtubeVideoId(`https://youtube.com.evil.test/watch?v=${ID}`)).toBeNull();
  });

  it("returns null when the path or ID is wrong", () => {
    expect(youtubeVideoId(`https://www.youtube.com/watch?list=PL123`)).toBeNull();
    expect(youtubeVideoId(`https://www.youtube.com/feed/trending`)).toBeNull();
    expect(youtubeVideoId(`https://www.youtube.com/embed/short`)).toBeNull();
    expect(youtubeVideoId(`https://www.youtube.com/embed/${ID}extra`)).toBeNull();
    expect(youtubeVideoId("https://www.youtube.com")).toBeNull();
  });

  it("returns null for unusable input", () => {
    expect(youtubeVideoId("")).toBeNull();
    expect(youtubeVideoId("   ")).toBeNull();
    expect(youtubeVideoId("not a url")).toBeNull();
    expect(youtubeVideoId(`ftp://youtube.com/watch?v=${ID}`)).toBeNull();
  });
});

describe("youtubeEmbedUrl", () => {
  it("builds a no-cookie embed URL", () => {
    expect(youtubeEmbedUrl(ID)).toBe(
      `https://www.youtube-nocookie.com/embed/${ID}`,
    );
  });
});