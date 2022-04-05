import { Deploy } from '../../generated/DBSFVaultFactoryDeployer/DBSFVaultFactoryDeployer'
import { DBSFVaultFactory } from '../../generated/templates'

export function handleDeployDBSF(event: Deploy): void {
	DBSFVaultFactory.create(event.params.addr)
}