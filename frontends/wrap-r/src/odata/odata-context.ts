import { PathHelper } from '@furystack/utils'
import { services } from 'sites'
/**
 * The OData endpoint context
 */
export const odataContext = {
  /**
   * The root of the odata service endpoint, e.g.: http://my-site/odata/
   */
  odataRootPath: PathHelper.joinPaths(services.wrapr, 'odata'),
  /**
   * Metadata creation date
   */
  creationDate: '2019-11-03T20:58:18.184Z',
}
