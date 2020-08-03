import { getFallbackMetadata } from './get-fallback-metadata'

describe('Get Fallback Metadata', () => {
  describe('title', () => {
    it('Should split by format', () => {
      const { title } = getFallbackMetadata('avengers.infinity.war.1080p.uhd-aaa.mkv')
      expect(title).toBe('avengers infinity war')
    })

    it('Should split by year', () => {
      const { title } = getFallbackMetadata('avengers.infinity.war.2018.720p.uhd-aaa.mkv')
      expect(title).toBe('avengers infinity war')
    })

    it('Should split season and episode', () => {
      const { title } = getFallbackMetadata('supernatural.S01E12.2018.720p.uhd-aaa.mkv')
      expect(title).toBe('supernatural')
    })
  })
})
