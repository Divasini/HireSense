def rank_candidates(screening_results: list) -> list:
    sorted_results = sorted(screening_results, key=lambda x: x.get('overall_score', 0), reverse=True)
    for i, res in enumerate(sorted_results):
        res['rank'] = i + 1
        res['recommendation_label'] = 'recommended'
    return sorted_results

def auto_shortlist(screening_results: list, threshold: float = 75.0) -> dict:
    res = {'strongly_recommended': [], 'recommended': [], 'consider': [], 'not_recommended': []}
    for item in screening_results:
        score = item.get('overall_score', 0)
        if score >= 85:
            res['strongly_recommended'].append(item)
        elif score >= 70:
            res['recommended'].append(item)
        elif score >= 55:
            res['consider'].append(item)
        else:
            res['not_recommended'].append(item)
    return res
