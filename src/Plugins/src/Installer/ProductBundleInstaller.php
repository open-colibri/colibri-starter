<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\PhpFile;
use OpenColibri\Starter\Core\Util\Assets;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Database;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\io;

final readonly class ProductBundleInstaller implements InstallerInterface
{
    public function name(): string
    {
        return 'product_bundle';
    }

    public function description(): string
    {
        return 'Product bundle for Sylius';
    }

    public function __invoke(App $app): void
    {
        io()->title('Adding Product Bundle plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer require sylius/product-bundle-plugin');

        (new PhpFile($app->directory() . '/src/Entity/Order/OrderItem.php'))
            ->addInterface(\Sylius\ProductBundlePlugin\Entity\OrderItemInterface::class) // @phpstan-ignore class.notFound
            ->addTrait(\Sylius\ProductBundlePlugin\Entity\ProductBundleOrderItemsAwareTrait::class) // @phpstan-ignore class.notFound
            ->addConstructor(<<<'PHP'

                    public function __construct()
                    {
                        parent::__construct();

                        $this->initializeProductBundleOrderItems();
                    }

                PHP)
            ->save()
        ;

        (new PhpFile($app->directory() . '/src/Entity/Product/Product.php'))
            ->addInterface(\Sylius\ProductBundlePlugin\Entity\ProductInterface::class) // @phpstan-ignore class.notFound
            ->addTrait(\Sylius\ProductBundlePlugin\Entity\ProductBundlesAwareTrait::class) // @phpstan-ignore class.notFound
            ->save()
        ;

        Docker::run($app, 'yarn install');
        Assets::build($app);
        Symfony::cacheClear($app);
    }
}
