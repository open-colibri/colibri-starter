<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Plugins\Installer;

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Core\Component\InstallerInterface;
use OpenColibri\Starter\Core\Util\Composer;
use OpenColibri\Starter\Core\Util\Docker;
use OpenColibri\Starter\Core\Util\Symfony;
use OpenColibri\Starter\Core\Util\Yaml;
use OpenColibri\Starter\Plugins\PluginResourceCopier;

use function Castor\io;

final readonly class RecaptchaInstaller implements InstallerInterface
{
    public function name(): string
    {
        return 'recaptcha';
    }

    public function description(): string
    {
        return 'Add Google reCAPTCHA v3 to customer registration';
    }

    public function __invoke(App $app): void
    {
        io()->title('Adding Google reCAPTCHA plugin');

        Composer::allowContribRecipes($app);
        Docker::run($app, 'composer require karser/karser-recaptcha3-bundle');

        Yaml::import($app, 'config/packages/_sylius.yaml', '../sylius/twig_hooks/**/**.php');

        PluginResourceCopier::copy($app, 'recaptcha');
        Symfony::cacheClear($app);
    }
}
