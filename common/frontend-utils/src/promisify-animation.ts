export const promisifyAnimation = async (
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: number | KeyframeAnimationOptions | undefined,
) =>
  new Promise((resolve, reject) => {
    const animation = el.animate(keyframes, options)
    animation.onfinish = resolve
    animation.oncancel = reject
  })
