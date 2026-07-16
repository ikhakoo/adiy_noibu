// For any link that has #chat as its href, make it open the chatbox

document.addEventListener('click', function (e) {
  const btn = e.target.closest('a[href="#chat"]');

  if (!btn) return;

  e.preventDefault();

  if (window.GorgiasChat?.open) {
    window.GorgiasChat.open();
  }
});


//  end



// remove #tag link which call from anchor 

document.addEventListener("click", function (e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  e.preventDefault();

  const target = document.querySelector(link.getAttribute("href"));
  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    history.replaceState(null, "", location.pathname + location.search);
  }
});

// end



document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll("video");

    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
        });
    },
    {
        threshold: 0.5 // 50% video visible ho to play
    }
    );

    videos.forEach((video) => {
    video.muted = true;       // Autoplay ke liye zaroori
    video.playsInline = true;
    observer.observe(video);
    });
});


let players = [];

// Load YouTube API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  const iframes = document.querySelectorAll(
    'iframe[src*="youtube.com"], iframe[src*="youtu.be"]'
  );

  iframes.forEach((iframe) => {
    const player = new YT.Player(iframe, {
      events: {
        onReady: function () {
          observePlayer(player, iframe);
        },
      },
    });

    players.push(player);
  });
}

function observePlayer(player, element) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  observer.observe(element);
}