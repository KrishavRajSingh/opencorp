// Official Reddit Inc. brand mark — Snoo inside OrangeRed conversation bubble
// Source: https://redditinc.com/brand (Reddit_Lockup_Logo.svg)
// Verbatim: only the bubble + Snoo symbol are included; the wordmark is dropped.

export function RedditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 216 216"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Reddit"
    >
      <defs>
        <radialGradient
          id="reddit-head-grad"
          cx="220.14"
          cy="135.08"
          fx="220.14"
          fy="135.08"
          r="384.44"
          gradientTransform="translate(0 40.35) scale(1 .7)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient
          id="reddit-ears-grad-left"
          cx="64.38"
          fx="64.38"
          fy="142.47"
          r="127.45"
          xlinkHref="#reddit-head-grad"
        />
        <radialGradient
          id="reddit-ears-grad-right"
          cx="370.49"
          cy="151.59"
          fx="370.49"
          fy="142.47"
          r="127.45"
          gradientTransform="translate(0 19.13) scale(1 .87)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#feffff" />
          <stop offset=".4" stopColor="#feffff" />
          <stop offset=".51" stopColor="#f9fcfc" />
          <stop offset=".62" stopColor="#edf3f5" />
          <stop offset=".7" stopColor="#dee9ec" />
          <stop offset=".72" stopColor="#d8e4e8" />
          <stop offset=".76" stopColor="#ccd8df" />
          <stop offset=".8" stopColor="#c8d5dd" />
          <stop offset=".83" stopColor="#ccd6de" />
          <stop offset=".85" stopColor="#d8dbe2" />
          <stop offset=".88" stopColor="#ede3e9" />
          <stop offset=".9" stopColor="#ffebef" />
        </radialGradient>
        <radialGradient
          id="reddit-bubble-grad"
          cx="134.7"
          cy="240.48"
          fx="134.7"
          fy="240.48"
          r="32.12"
          gradientTransform="translate(0 -110.04) scale(1 1.46)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f60" />
          <stop offset=".5" stopColor="#ff4500" />
          <stop offset=".7" stopColor="#fc4301" />
          <stop offset=".82" stopColor="#f43f07" />
          <stop offset=".92" stopColor="#e53812" />
          <stop offset="1" stopColor="#d4301f" />
        </radialGradient>
        <radialGradient
          id="reddit-eye-grad"
          cx="6191.5"
          cy="240.48"
          fx="6191.5"
          fy="240.48"
          r="32.12"
          gradientTransform="translate(6489.32 -110.04) rotate(-180) scale(1 -1.46)"
          xlinkHref="#reddit-bubble-grad"
        />
        <radialGradient
          id="reddit-mouth-grad"
          cx="215.93"
          cy="338.52"
          fx="215.93"
          fy="338.52"
          r="113.26"
          gradientTransform="translate(0 116.39) scale(1 .66)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#172e35" />
          <stop offset=".29" stopColor="#0e1c21" />
          <stop offset=".73" stopColor="#030708" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <radialGradient
          id="reddit-antenna-ball"
          cx="274.38"
          cy="103.82"
          fx="274.38"
          fy="103.82"
          r="81.49"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".48" stopColor="#7a9299" />
          <stop offset=".67" stopColor="#172e35" />
          <stop offset=".75" stopColor="#000" />
          <stop offset=".82" stopColor="#172e35" />
        </radialGradient>
        <radialGradient
          id="reddit-antenna-stalk"
          cx="315.81"
          cy="3.47"
          fx="315.81"
          fy="3.47"
          r="99.42"
          gradientTransform="translate(0 .06) scale(1 .98)"
          xlinkHref="#reddit-head-grad"
        />
        <symbol id="reddit-snoo" viewBox="0 0 432.21 377.72">
          <circle
            fill="url(#reddit-ears-grad-right)"
            cx="369.16"
            cy="188.55"
            r="63.05"
          />
          <circle
            fill="url(#reddit-ears-grad-left)"
            cx="63.05"
            cy="188.55"
            r="63.05"
          />
          <ellipse
            fill="url(#reddit-head-grad)"
            cx="216.26"
            cy="242.72"
            rx="180"
            ry="135"
          />
          <path
            fill="#842123"
            d="m163.04,229.59c-1.05,22.87-16.23,31.17-33.91,31.17s-31.15-11.71-30.09-34.58c1.05-22.87,16.23-38.01,33.91-38.01s31.15,18.54,30.09,41.42Z"
          />
          <path
            fill="#842123"
            d="m333.48,226.18c1.05,22.87-12.42,34.58-30.09,34.58s-32.85-8.3-33.91-31.17c-1.05-22.87,12.42-41.42,30.09-41.42s32.85,15.13,33.91,38.01Z"
          />
          <path
            fill="url(#reddit-bubble-grad)"
            d="m163.05,231.59c-.99,21.41-15.19,29.17-31.73,29.17s-29.15-11.63-28.16-33.03c.99-21.41,15.19-35.41,31.73-35.41s29.15,17.86,28.16,39.27Z"
          />
          <path
            fill="url(#reddit-eye-grad)"
            d="m269.47,231.59c.99,21.41,15.19,29.17,31.73,29.17,16.54,0,29.15-11.63,28.16-33.03-.99-21.41-15.19-35.41-31.73-35.41s-29.15,17.86-28.16,39.27Z"
          />
          <ellipse fill="#ffc49c" cx="145.19" cy="212.04" rx="7" ry="7.64" />
          <ellipse fill="#ffc49c" cx="311.64" cy="212.04" rx="7" ry="7.64" />
          <path
            fill="#bbcfda"
            d="m216.26,276.02c-22.32,0-43.71,1.08-63.49,3.04-3.38.34-5.52,3.78-4.21,6.86,11.08,25.97,37.22,44.21,67.7,44.21s56.62-18.24,67.7-44.21c1.31-3.08-.83-6.52-4.21-6.86-19.78-1.97-41.17-3.04-63.49-3.04Z"
          />
          <path
            fill="#fff"
            d="m216.26,280.98c-22.25,0-43.57,1.09-63.29,3.09-3.37.34-5.51,3.84-4.2,6.97,11.05,26.38,37.1,44.91,67.49,44.91s56.44-18.53,67.49-44.91c1.31-3.12-.83-6.62-4.2-6.97-19.72-2-41.04-3.09-63.29-3.09Z"
          />
          <path
            fill="url(#reddit-mouth-grad)"
            d="m216.26,278.4c-21.9,0-42.89,1.08-62.3,3.04-3.32.34-5.42,3.78-4.13,6.86,10.87,25.97,36.52,44.21,66.44,44.21s55.56-18.24,66.44-44.21c1.29-3.08-.81-6.52-4.13-6.86-19.41-1.97-40.4-3.04-62.31-3.04Z"
          />
          <circle
            fill="url(#reddit-antenna-ball)"
            cx="314.84"
            cy="44.68"
            r="44.68"
          />
          <path
            fill="url(#reddit-mouth-grad)"
            d="m215.62,113.41c-5.35,0-9.69-2.24-9.69-5.69,0-40.03,32.56-72.59,72.59-72.59,5.35,0,9.69,4.34,9.69,9.69s-4.34,9.69-9.69,9.69c-29.34,0-53.22,23.87-53.22,53.22,0,3.45-4.34,5.69-9.69,5.69Z"
          />
          <path
            fill="#ff6101"
            d="m151.29,242.18c0,8.28-8.81,12-19.69,12s-19.69-3.72-19.69-12,8.81-15,19.69-15,19.69,6.72,19.69,15Z"
          />
          <path
            fill="#ff6101"
            d="m320.6,242.18c0,8.28-8.81,12-19.69,12s-19.69-3.72-19.69-12,8.81-15,19.69-15,19.69,6.72,19.69,15Z"
          />
        </symbol>
      </defs>
      <path
        fill="url(#reddit-bubble-grad)"
        d="m108,0h0C48.35,0,0,48.35,0,108h0c0,29.82,12.09,56.82,31.63,76.37l-20.57,20.57c-4.08,4.08-1.19,11.06,4.58,11.06h92.36s0,0,0,0c59.65,0,108-48.35,108-108h0C216,48.35,167.65,0,108,0Z"
      />
      <use
        href="#reddit-snoo"
        width="172.88"
        height="151.09"
        x="21.56"
        y="31.55"
      />
    </svg>
  );
}
