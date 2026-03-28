<?php

function getMemberData(): array {
    return [
        ['id' => 1,  'firstName' => 'John',       'lastName' => 'Davis',     'company' => 'PromoWorks Inc.',        'email' => 'j.davis@promoworks.com',      'memberSince' => 2019],
        ['id' => 2,  'firstName' => 'Sarah',       'lastName' => 'Mitchell',  'company' => 'BrandForward LLC',       'email' => 'sarah@brandforward.com',      'memberSince' => 2021],
        ['id' => 3,  'firstName' => 'Michael',     'lastName' => 'Chen',      'company' => 'Creative Merch Co.',     'email' => 'mchen@creativemerch.com',     'memberSince' => 2023],
        ['id' => 4,  'firstName' => 'Emily',       'lastName' => 'Rodriguez', 'company' => 'SwagSource Direct',      'email' => 'emily.r@swagsource.com',      'memberSince' => 2020],
        ['id' => 5,  'firstName' => 'David',       'lastName' => 'Thompson',  'company' => 'PrintPro Solutions',     'email' => 'dthompson@printpro.com',      'memberSince' => 2018],
        ['id' => 6,  'firstName' => 'Jessica',     'lastName' => 'Park',      'company' => 'AdVantage Promotions',   'email' => 'jpark@advantagepromo.com',    'memberSince' => 2022],
        ['id' => 7,  'firstName' => 'Robert',      'lastName' => 'Williams',  'company' => 'Pinnacle Branding',      'email' => 'rwilliams@pinnaclebrand.com', 'memberSince' => 2017],
        ['id' => 8,  'firstName' => 'Amanda',      'lastName' => 'Foster',    'company' => 'LogoLine Distributors',  'email' => 'amanda@logoline.com',         'memberSince' => 2024],
        ['id' => 9,  'firstName' => 'Christopher', 'lastName' => 'Nguyen',    'company' => 'PromoWorks Inc.',        'email' => 'cnguyen@promoworks.com',      'memberSince' => 2021],
        ['id' => 10, 'firstName' => 'Lauren',      'lastName' => 'Baker',     'company' => 'Imprint Experts',        'email' => 'lbaker@imprintexperts.com',   'memberSince' => 2020],
        ['id' => 11, 'firstName' => 'James',       'lastName' => 'Sullivan',  'company' => 'BrandForward LLC',       'email' => 'jsullivan@brandforward.com',  'memberSince' => 2019],
        ['id' => 12, 'firstName' => 'Megan',       'lastName' => 'Patel',     'company' => 'SwagSource Direct',      'email' => 'mpatel@swagsource.com',       'memberSince' => 2023],
    ];
}

function getAllMembers(): array {
    return getMemberData();
}

function searchMembers(string $nameQuery, string $companyQuery): array {
    $members = getMemberData();

    if ($nameQuery !== '') {
        $members = array_values(array_filter($members, function (array $member) use ($nameQuery): bool {
            return stripos($member['firstName'], $nameQuery) !== false
                || stripos($member['lastName'],  $nameQuery) !== false;
        }));
    }

    if ($companyQuery !== '') {
        $members = array_values(array_filter($members, function (array $member) use ($companyQuery): bool {
            return stripos($member['company'], $companyQuery) !== false;
        }));
    }

    return $members;
}

function getMemberById(int $id): ?array {
    foreach (getMemberData() as $member) {
        if ($member['id'] === $id) {
            return $member;
        }
    }
    return null;
}

function filterByYear(array $members, int $year): array {
    return array_values(array_filter($members, function (array $member) use ($year): bool {
        return $member['memberSince'] === $year;
    }));
}

function filterByYearOrEarlier(array $members, int $year): array {
    return array_values(array_filter($members, function (array $member) use ($year): bool {
        return $member['memberSince'] <= $year;
    }));
}

function sortMembers(array $members, string $field, string $order): array {
    usort($members, function (array $a, array $b) use ($field, $order): int {
        $cmp = 0;

        switch ($field) {
            case 'name':
                $cmp = strcmp($a['lastName'], $b['lastName']);
                if ($cmp === 0) {
                    $cmp = strcmp($a['firstName'], $b['firstName']);
                }
                break;

            case 'company':
                $cmp = strcmp($a['company'], $b['company']);
                break;

            case 'year':
                $cmp = $a['memberSince'] <=> $b['memberSince'];
                break;
        }

        return $order === 'desc' ? -$cmp : $cmp;
    });

    return $members;
}
