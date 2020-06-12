export interface FfprobeStream {
  index: number
  codec_name: string
  codec_long_name: string
  profile: string
  codec_type: string
  codec_time_base: string
  codec_tag_string: string
  codec_tag: string
  width: number
  height: number
  coded_width: number
  coded_height: number
  has_b_frames: number
  sample_aspect_ratio: string
  display_aspect_ratio: string
  pix_fmt: string
  level: number
  color_range: string
  color_space: string
  color_transfer: string
  color_primaries: string
  refs: number
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
  disposition: {
    default: number
    dub: number
    original: number
    comment: number
    lyrics: number
    karaoke: number
    forced: number
    hearing_impaired: number
    visual_impaired: number
    clean_effects: number
    attached_pic: number
    timed_thumbnails: number
  }
  tags: {
    language: string
    BPS: string
    'BPS-eng': string
    DURATION: string
    'DURATION-eng': string
    NUMBER_OF_FRAMES: string
    'NUMBER_OF_FRAMES-eng': string
    NUMBER_OF_BYTES: string
    'NUMBER_OF_BYTES-eng': string
    _STATISTICS_WRITING_APP: string
    '_STATISTICS_WRITING_APP-eng': string
    _STATISTICS_WRITING_DATE_UTC: string
    '_STATISTICS_WRITING_DATE_UTC-eng': string
    _STATISTICS_TAGS: string
    '_STATISTICS_TAGS-eng': string
  }
}

export interface FfprobeFormat {
  filename: string
  nb_streams: number
  nb_programs: number
  format_name: string
  format_long_name: string
  start_time: string
  duration: string
  size: string
  bit_rate: string
  probe_score: number
  tags: Record<string, string>
}

export interface FfprobeMetadata {
  streams: FfprobeStream[]
  format: FfprobeFormat
}
