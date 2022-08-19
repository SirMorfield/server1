<?php
$CONFIG = array (
	'htaccess.RewriteBase' => '/',
	'memcache.local' => '\\OC\\Memcache\\APCu',
	'apps_paths' =>
	array (
		0 =>
		array (
			'path' => '/var/www/html/apps',
			'url' => '/apps',
			'writable' => false,
		),
		1 =>
		array (
			'path' => '/var/www/html/custom_apps',
			'url' => '/custom_apps',
			'writable' => true,
		),
	),
	'instanceid' => 'ociewe3mpbr3',
	'passwordsalt' => 'INJECT_PASSWORD_SALT',
	'secret' => 'INJECT_SECRET',
	'trusted_domains' =>
	array (
		0 => 'nextcloud-app',
		1 => 'localhost',
		2 => 'nextcloud.joppekoers.nl',
	),
	'datadirectory' => '/var/www/html/data',
	'dbtype' => 'mysql',
	'version' => '24.0.4.1',
	'overwrite.cli.url' => 'http://nextcloud-app',
	'dbname' => 'nextcloud',
	'dbhost' => 'nextcloud-db',
	'dbport' => '',
	'dbtableprefix' => 'oc_',
	'mysql.utf8mb4' => true,
	'dbuser' => 'nextcloud',
	'dbpassword' => 'password',
	'installed' => true,

	'debug' => false,
	'loglevel' => 2,
	'filesystem_check_changes' => 1,
);
