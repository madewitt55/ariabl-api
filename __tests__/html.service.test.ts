import {parseHtmlTags, type Tag} from '../src/services/html.service';

describe('HTML SERVICE', () => {
    describe('FUNCTION parseHtmlTags', () => {
        describe('given valid `html`', () => {
            // ARRANGE
            const tagNames: string[] = ['html', 'head'];
            const numTags: number = tagNames.length;

            const html: string = `<${tagNames[0]}><${tagNames[1]}></${tagNames[1]}></${tagNames[0]}>`;

            it('should return array `tags` where `tags[i].isClosed` is `true` for all `i`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags.some((t: Tag) => t.isClosed === false)).toBe(false);
            });

            it('should return array `tags` with all tags included', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSSERT
                expect(tags.length).toBe(numTags);
                tags.forEach((t: Tag, i: number) => expect(t.name).toBe(tagNames[i]));
            });
        });
        describe('given `html` with an unclosed tag', () => {
            // ARRANGE
            const html: string = `<html><head></head>`;
            const unclosedIndex: number = 0;

            it('should return array `tags` where `tags[i].isClosed` is `false` for index `i` of unclosed tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[unclosedIndex]?.isClosed).toBe(false);
            });
            it('should return array `tags` where `tags[i].isClosed` is `true` for all `i` except index of unclosed tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                tags.forEach((t: Tag, i: number) => {
                    if (i !== unclosedIndex) {
                        expect(t.isClosed).toBe(true);
                    }
                });
            });
        });
        describe('given `html` containing no tags', () => {
            // ARRANGE
            const html: string = 'invalid html';

            it('should return an empty array `tags`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags.length).toBe(0);
            });
        });
    });
});
