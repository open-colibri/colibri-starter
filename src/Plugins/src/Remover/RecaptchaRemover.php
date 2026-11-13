<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;

use function Castor\finder;
use function Castor\fs;
use function Castor\io;

final readonly class RecaptchaRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'recaptcha';
    }

    public function description(): string
    {
        return 'Remove Google reCAPTCHA v3 to customer registration';
    }

    public function __invoke(App $app): void
    {
        io()->title('Removing Google reCAPTCHA plugin');

        Composer::allowContribRecipes($app);

        $resourcesDir = \dirname(__DIR__, 2) . '/resources/recaptcha';

        foreach (finder()->files()->in($resourcesDir)->files() as $file) {
            fs()->remove($app->directory() . '/' . $file->getRelativePathname());
        }

        Docker::run($app, 'composer remove karser/karser-recaptcha3-bundle');

        Symfony::cacheClear($app);
    }
}
