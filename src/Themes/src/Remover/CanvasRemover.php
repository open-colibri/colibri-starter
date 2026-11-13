<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Themes\Remover;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Component\RemoverInterface;
use OpenColibri\Starter\Core\Util\Javascript;
use OpenColibri\Starter\Themes\ColorScheme;

use function Castor\finder;
use function Castor\fs;

final class CanvasRemover implements RemoverInterface
{
    public function name(): string
    {
        return 'canvas';
    }

    public function description(): ?string
    {
        return null;
    }

    public function __invoke(App $app): void
    {
        $resourcesDir = \dirname(__DIR__, 2) . '/resources/canvas';

        foreach (finder()->files()->in($resourcesDir)->files() as $file) {
            fs()->remove($app->directory() . '/' . $file->getRelativePathname());
        }
        Javascript::removeImport($app, 'assets/shop/entrypoint.js', './styles/app.scss');
        ColorScheme::remove($app);
    }
}
