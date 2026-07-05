/**
 * @typedef {Object} PlayerChip
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} initials
 * @property {number} dupr
 * @property {boolean} [captain]
 * @property {boolean} [sub]
 */

/**
 * @typedef {Object} TeamRow
 * @property {number} seed
 * @property {string} initials
 * @property {string} name
 * @property {string} location
 * @property {string} teamDupr
 * @property {PlayerChip[]} players
 * @property {PlayerChip[]} [subs]
 */

/**
 * @typedef {Object} TournamentPageData
 * @property {string} slug
 * @property {string} brandTitle
 * @property {string} brandSubtitle
 * @property {string} brandLogoUrl
 * @property {string} title
 * @property {string} badge
 * @property {string} bannerUrl
 * @property {string} volairLogoUrl
 * @property {Array<{icon: string, label: string, value: string}>} infoBar
 * @property {{name: string, address: string, mapsUrl: string}} venue
 * @property {{initials: string, name: string, role: string, email: string, phone: string, phoneHref: string}} organizer
 * @property {Object} tabs
 */

export {};
