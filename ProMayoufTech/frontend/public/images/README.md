# ProMayouf Product Images

This directory contains all product images used in the ProMayouf e-commerce platform.

## Image Structure

Images are referenced in the application using the path `/images/filename.jpg`, which maps to this directory.

## Suit Images

The following suit images are available:
- black-tuxedo.jpg
- pinstripe-suit.jpg
- navy-suit.jpg
- gray-suit.jpg
- charcoal-suit.jpg
- blue-suit.jpg
- sample.jpg (generic sample product)

## Important Notes

1. **Image Not Found Errors**: If you encounter 404 errors for product images, ensure the image exists in this directory.

2. **Product Database**: Product records in MongoDB reference these image paths. If you update an image name, make sure to update the corresponding product record.

3. **Adding New Images**: When adding new product images:
   - Place them in this directory
   - Use consistent naming conventions
   - Use JPG format for photos
   - Keep file sizes reasonable (ideally under 100KB)

4. **Image Paths**: Images are served from the `/images` route by the Express server in development and production. 