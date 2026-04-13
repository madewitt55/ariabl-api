import {parseHtmlTags, type Tag} from '../src/services/html.service';

describe('HTML SERVICE', () => {
    describe('FUNCTION parseHtmlTags', () => {
        describe('given valid `html` with root tags', () => {
            // ARRANGE
            const html: string = `<head></head><body></body>`;

            it('should return array `tags` with the root tags', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags.length).toBe(2);
            });
            it('should return array `tags` where `tags[i].children` is empty for all `i`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                tags.forEach((tag: Tag) => {
                    expect(tag.children.length).toBe(0);
                });
            });
        });
        describe('given `html` with nested tags', () => {
            // ARRANGE
            const html: string = `
                <html>
                    <head>
                        <h1></h1>
                    </head>
                </html>`;
            const numTotalChildren: number = 2;
            const numDirectChildren: number = 1;

            it('should return array `tags` where `tags[i].children` contains all direct child tags for any `i`', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);
                console.log(tags)

                // ASSERT
                expect(tags[0]?.children.length).toBe(numDirectChildren);
            });
            it('should return array `tags` where all tags are included in the nested structure', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                tags[0]?.children.forEach((child: Tag) => {
                    const countAllChildren = (tag: Tag): number =>
                        tag.children.length + tag.children.reduce((sum, c) => sum + countAllChildren(c), 0);
                    expect(countAllChildren(child) + 1).toBe(numTotalChildren);
                });
            });
        });
        describe('given `html` with a self-closing non-void tag', () => {
            // ARRANGE
            const html: string = `<html/>`;
            const error: string = 'SELF_CLOSING';

            it('should return array `tags` where the self closing tag contains the attached error', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[0]?.error).toBe(error);
            });
        });
        describe('given `html` with a self-closing non-void tag', () => {
            // ARRANGE
            const html: string = `<meta>`;
            const error: string = 'NOT_SELF_CLOSING';

            it('should return array `tags` where the void tag contains the attached error', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[0]?.error).toBe(error);
            });
        });
        describe('given `html` with an unclosed non-void tag', () => {
            // ARRANGE
            const html: string = `<html>`;
            const error: string = 'UNCLOSED';

            it('should return array `tags` where the unclosed tag contains the attached error', () => {
                // ACT
                const tags: Tag[] = parseHtmlTags(html);

                // ASSERT
                expect(tags[0]?.error).toBe(error);
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
