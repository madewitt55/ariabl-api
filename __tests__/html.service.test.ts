import {parseHtmlTags, type Tag} from '../src/services/html.service';

describe('HTML SERVICE', () => {
    describe('FUNCTION parseHtmlTags', () => {
        describe('given valid `html`', () => {
            // ARRANGE
            const tagNames: string[] = ['html', 'head'];
            const numTags: number = 2;
            const html: string = `<html><head></head></html>`;

            it('should return array `tags` where `tags[i].error` is `null` for all `i`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags.some((t: Tag) => t.error)).toBe(false);
            });

            it('should return array `tags` with all tags included', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSSERT
                expect(tags.length).toBe(numTags);
                tagNames.forEach((tagName: string) => {
                    expect(tags.some((tag: Tag) => tag.tagName === tagName)).toBe(true);
                });
            });
        });
        describe('given `html` with an unclosed tag', () => {
            // ARRANGE
            const html: string = `<html><head></head>`;
            const unclosedIndex: number = 0;

            it('should return array `tags` where `tags[i].error` is `UNCLOSED_TAG` for index `i` of unclosed tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[unclosedIndex]?.error).toBe('UNCLOSED');
            });
        });
        describe('given `html` with an orphaned close tag', () => {
            // ARRANGE
            const html: string = `<html></head></html>`;
            const orphanedIndex: number = 1;

            it('should return array `tags` where `tags[i].error` is `OPRHANED_CLOSE` for index `i` of orphaned close tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[orphanedIndex]?.error).toBe('ORPHANED_CLOSE');
            });
        });
        describe('given `html` with a self-closing non-void tag', () => {
            // ARRANGE
            const html: string = `<html><head/></html>`;
            const selfClosingIndex: number = 1;

            it('should return array `tags` where `tags[i].error` is `SELF_CLOSING` for index `i` of self-closing tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[selfClosingIndex]?.error).toBe('SELF_CLOSING');
            });
        });
        describe('given `html` with a non-self-closing void tag', () => {
            // ARRANGE
            const html: string = `<html><br></br></html>`;
            const nonSelfClosingIndex: number = 1;

            it('should return array `tags` where `tags[i].error` is `NOT_SELF_CLOSING` for index `i` of non-self-closing tag', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[nonSelfClosingIndex]?.error).toBe('NOT_SELF_CLOSING');
            });
        });
        describe('given `html` containing no tags', () => {
            // ARRANGE
            const html: string = 'no tags here';

            it('should return an empty array `tags`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags.length).toBe(0);
            });
        });
    });
});
