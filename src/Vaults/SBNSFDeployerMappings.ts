import { Deploy } from '../../generated/SBNSFVaultFactoryDeployer/SBNSFVaultFactoryDeployer'
import { SBNSFVaultFactory } from '../../generated/templates'

export function handleDeployDBSF(event: Deploy): void {
	SBNSFVaultFactory.create(event.params.addr)
}