
# Add "How It Works" Video to Landing Page

## Overview

Add a video section to the landing page that showcases how the app works. This will be placed prominently to help new visitors understand the product flow visually.

## Placement Options

The video will be added **within the existing "How It Works" section**, positioned between the header and the 3-step icons. This keeps all "how it works" content together in one cohesive section.

```text
┌─────────────────────────────────────────┐
│           How It Works                  │
│  Delicious meals from your fridge...    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │         ▶️ VIDEO PLAYER           │  │
│  │     (Demo of app in action)       │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│   📷 Scan    ⚠️ Allergies    👨‍🍳 Cook   │
│                                         │
└─────────────────────────────────────────┘
```

## Implementation Details

### Video Player Features

| Feature | Description |
|---------|-------------|
| Responsive | Full-width on mobile, contained on desktop (max 800px) |
| 16:9 Aspect Ratio | Standard video dimensions maintained |
| Rounded corners | Matches the app's design language |
| Shadow | Subtle shadow to make it pop |
| Play button overlay | Shows a play icon over the thumbnail |

### Video Source Options

The component will support:

1. **YouTube embed** - Just add your YouTube video ID
2. **Vimeo embed** - Just add your Vimeo video ID  
3. **Self-hosted video** - Upload an MP4 to your project
4. **Placeholder thumbnail** - Shows an attractive thumbnail with a play button until you add your video

### Initial Setup

For now, I'll create the video section with a placeholder thumbnail that shows:
- An attractive food/cooking themed preview image
- A centered play button
- Text saying "Watch how it works"

You can easily swap this with your actual video by updating a single `videoUrl` or `youtubeId` prop.

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/landing/HowItWorksVideo.tsx` | **Create** | New video player component |
| `src/components/landing/HowItWorksSection.tsx` | **Modify** | Import and add the video component |

## Technical Details

### HowItWorksVideo Component

```text
Props:
├── youtubeId?: string    (e.g., "dQw4w9WgXcQ")
├── vimeoId?: string      (e.g., "123456789")
├── videoUrl?: string     (e.g., "/demo-video.mp4")
└── thumbnailUrl?: string (custom thumbnail image)

Behavior:
├── If youtubeId → Embed YouTube iframe
├── If vimeoId → Embed Vimeo iframe
├── If videoUrl → Native <video> element
└── If none → Show placeholder with play button
```

### Animations

- Video container fades in and scales up slightly on scroll
- Play button has a subtle pulse animation
- Hover effect on the thumbnail increases brightness

### Mobile Considerations

- Full-width video on mobile (with small padding)
- Touch-friendly play button (larger tap target)
- Proper aspect ratio maintained on all screen sizes
