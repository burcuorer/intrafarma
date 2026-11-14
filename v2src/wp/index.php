<?php
/** Tasarımı olmayan sayfalar için sade görünüm */
if (!defined('ABSPATH')) { exit; }
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('if-plain'); ?>>
<header class="if-plain-top"><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></header>
<main class="if-plain-main">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?><article><h1><?php the_title(); ?></h1><?php the_content(); ?></article><?php endwhile; endif; ?>
</main>
<?php wp_footer(); ?></body></html>
