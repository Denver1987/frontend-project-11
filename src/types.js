/**
 * Содержит описание RSS-канала
 * @typedef Feed
 * @prop {string} feedId
 * @prop {string} description
 * @prop {string} title
 * @prop {string} url
 */

/**
 * Содержит описание RSS-поста
 * @typedef Post
 * @prop {string} id
 * @prop {Feed["feedId"]} feedId
 * @prop {string} link
 * @prop {string} title
 * @prop {string} text
 */
