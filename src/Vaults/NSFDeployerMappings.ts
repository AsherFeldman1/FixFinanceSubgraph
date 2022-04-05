import { Deploy } from '../../generated/NSFVaultFactoryDeployer/NSFVaultFactoryDeployer'
import { NSFVaultFactory } from '../../generated/templates'

export function handleDeployNSF(event: Deploy): void {
	NSFVaultFactory.create(event.params.addr)
}